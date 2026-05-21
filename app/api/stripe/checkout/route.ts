/**
 * RUTA DE API: Crear sesión de pago con Stripe
 *
 * Cuando el estudiante completa la matrícula y hace clic en "Pagar",
 * esta ruta crea una sesión de Stripe Checkout y devuelve la URL
 * para redirigir al estudiante a la página de pago segura de Stripe.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    if (!stripeKey || stripeKey.startsWith('sk_test_tu-')) {
      console.error('STRIPE_SECRET_KEY no está configurada o tiene valor de ejemplo');
      return NextResponse.json(
        { error: 'La clave de Stripe no está configurada. Contacta al administrador.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });

    const body = await request.json();
    const { registrationId, wantsBookShipping } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Falta el ID de matrícula' },
        { status: 400 }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Curso de Certificación de Navegación - Ley 430 PR',
            description: "America's Boating Club - Boqueron Power Squadron",
          },
          unit_amount: 8000,
        },
        quantity: 1,
      },
    ];

    if (wantsBookShipping) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Envío de Libro de Texto por Correo',
            description: 'Libro de navegación enviado a tu dirección postal',
          },
          unit_amount: 1300,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      // Si el usuario cancela en Stripe, volvemos con el id para borrar el borrador pendiente
      cancel_url: `${siteUrl}/matricula?canceled=true&registration_id=${registrationId}`,
      metadata: {
        registrationId: registrationId,
      },
    });

    await supabaseAdmin
      .from('registrations')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', registrationId);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error al crear sesión de Stripe:', error);

    let userMessage = 'Error al crear la sesión de pago.';
    if (error.type === 'StripeAuthenticationError') {
      userMessage = 'Error de autenticación con el procesador de pagos. Contacta al administrador.';
    } else if (error.message) {
      userMessage = error.message;
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
