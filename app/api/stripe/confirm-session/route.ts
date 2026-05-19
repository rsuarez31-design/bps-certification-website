/**
 * RUTA API: Confirmar pago usando el session_id de Checkout (respaldo del webhook)
 *
 * Cuando el estudiante vuelve de Stripe a /pago-exitoso?session_id=...
 * llamamos a esta ruta desde el navegador. El servidor consulta a Stripe
 * si la sesión está pagada y actualiza la matrícula en Supabase.
 *
 * Así el panel administrativo muestra "Pagada" aunque el webhook
 * no haya llegado (URL mal puesta, secreto incorrecto, etc.).
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sendWelcomeEmailForRegistration } from '@/lib/registration-email-events';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe no está configurado en el servidor' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const sessionId = body.sessionId as string | undefined;
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return NextResponse.json(
        { error: 'sessionId de Checkout no válido' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, message: 'La sesión aún no está marcada como pagada en Stripe.' },
        { status: 200 }
      );
    }

    const registrationId = session.metadata?.registrationId;
    if (!registrationId) {
      return NextResponse.json(
        { error: 'La sesión no tiene matrícula asociada (metadata)' },
        { status: 400 }
      );
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const { error } = await supabaseAdmin
      .from('registrations')
      .update({
        payment_status: 'paid',
        stripe_checkout_session_id: session.id,
        ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
      })
      .eq('id', registrationId);

    if (error) {
      console.error('confirm-session: error al actualizar matrícula', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await sendWelcomeEmailForRegistration(registrationId);

    return NextResponse.json({ success: true, registrationId });
  } catch (err: any) {
    console.error('confirm-session:', err);
    return NextResponse.json(
      { error: err.message || 'Error al confirmar el pago' },
      { status: 500 }
    );
  }
}
