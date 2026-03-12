/**
 * RUTA DE API: Webhook de Stripe
 *
 * Stripe nos avisa aquí cuando un pago se completa.
 * Es más confiable que verificar cuando el estudiante regresa,
 * porque funciona aunque el estudiante cierre la ventana.
 *
 * IMPORTANTE: Esta ruta recibe datos directamente de Stripe,
 * por eso necesitamos verificar que la solicitud sea auténtica.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-server';

// Crear el cliente de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Clave secreta para verificar que el mensaje viene de Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Leer el cuerpo crudo de la solicitud (Stripe necesita el texto sin procesar)
    const body = await request.text();

    // Obtener la firma que Stripe puso en la solicitud
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Falta la firma de Stripe' },
        { status: 400 }
      );
    }

    // Verificar que la solicitud realmente viene de Stripe
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Error al verificar firma del webhook:', err.message);
      return NextResponse.json(
        { error: 'Firma del webhook inválida' },
        { status: 400 }
      );
    }

    // Procesar el evento según su tipo
    if (event.type === 'checkout.session.completed') {
      // El pago se completó exitosamente
      const session = event.data.object as Stripe.Checkout.Session;

      // Obtener el ID de matrícula que guardamos al crear la sesión
      const registrationId = session.metadata?.registrationId;

      if (registrationId) {
        // Actualizar la matrícula en la base de datos: marcarla como "pagada"
        const { error } = await supabaseAdmin
          .from('registrations')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', registrationId);

        if (error) {
          console.error('Error al actualizar matrícula:', error);
        } else {
          console.log(`Matrícula ${registrationId} marcada como PAGADA`);
        }
      }
    }

    // Responder a Stripe que recibimos el evento correctamente
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
