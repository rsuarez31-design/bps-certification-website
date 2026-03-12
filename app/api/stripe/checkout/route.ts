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

// Crear el cliente de Stripe usando la clave secreta del servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// URL base del sitio (para redirecciones después del pago)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Leer los datos que nos envía el formulario de matrícula
    const body = await request.json();
    const { registrationId, wantsBookShipping } = body;

    // Verificar que nos enviaron el ID de matrícula
    if (!registrationId) {
      return NextResponse.json(
        { error: 'Falta el ID de matrícula' },
        { status: 400 }
      );
    }

    // Crear los "artículos" del carrito de compras para Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        // Artículo 1: Curso de Navegación ($80)
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Curso de Certificación de Navegación - Ley 430 PR',
            description: 'Americas Boating Club - Boqueron Power Squadron',
          },
          unit_amount: 8000, // $80.00 en centavos
        },
        quantity: 1,
      },
    ];

    // Si el estudiante quiere el libro por correo, agregar el cargo extra
    if (wantsBookShipping) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Envío de Libro de Texto por Correo',
            description: 'Libro de navegación enviado a tu dirección postal',
          },
          unit_amount: 1300, // $13.00 en centavos
        },
        quantity: 1,
      });
    }

    // Crear la sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],   // Solo aceptar tarjetas de crédito/débito
      line_items: lineItems,            // Los artículos a pagar
      mode: 'payment',                  // Pago único (no suscripción)
      // A dónde llevar al estudiante después del pago exitoso
      success_url: `${siteUrl}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      // A dónde llevar al estudiante si cancela el pago
      cancel_url: `${siteUrl}/matricula?canceled=true`,
      // Guardar el ID de matrícula para identificarlo en el webhook
      metadata: {
        registrationId: registrationId,
      },
    });

    // Guardar el ID de la sesión de Stripe en la matrícula
    await supabaseAdmin
      .from('registrations')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', registrationId);

    // Devolver la URL de la sesión de pago
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error al crear sesión de Stripe:', error);
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago: ' + error.message },
      { status: 500 }
    );
  }
}
