// Netlify Forms submission helper. Forms are registered at deploy time via
// the hidden static forms in public/__forms.html; runtime submissions are a
// urlencoded POST to any path on the site.

export async function submitForm(
  formName: string,
  fields: Record<string, string>,
): Promise<boolean> {
  const body = new URLSearchParams({ "form-name": formName, ...fields })
  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
    return res.ok
  } catch {
    return false
  }
}
