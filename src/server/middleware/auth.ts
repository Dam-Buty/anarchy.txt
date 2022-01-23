export async function frontPage(req, res) {
  const { url } = await req.supabase.auth.signIn({ provider: "discord" });

  res.end(`
  <html>
  <body>
    <pre>${url}</pre>
  </body>
  </html>`);
}

export async function oauthPage(req, res) {
  res.end(`<html>
  <body>
  <pre id="content"></pre>
  <script>
    const hash = window.location.hash;
    document.getElementById("content").textContent = JSON.stringify(
      hash
        .split("#")[1]
        .split("&")
        .map(element => element.split("="))
        .reduce((acc, curr) => {
          acc[curr[0]] = curr[1];
          return acc;
        }, {}),
      null,
      2
    )
  </script>
  </body>
  </html>
  `);
}
