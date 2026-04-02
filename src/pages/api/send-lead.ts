import type { APIRoute } from 'astro';

const FORM_ACTION =
  import.meta.env.PUBLIC_FORM_ACTION ??
  'https://script.google.com/macros/s/AKfycbzCT1aeSBP8LROuszNjbLTibvk08NttjLi_4UEyozgzdPAm2i9hsvjsTcziBHspBqW0vg/exec';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const res = await fetch(FORM_ACTION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: { ok?: boolean; error?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({
          ok: false,
          error:
            'Server vrátil neočekávanou odpověď. Zkontrolujte nasazení Web App (Kdokoli, i anonymní).',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Nepodařilo se odeslat. Zkontrolujte připojení a zkuste to znovu.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
