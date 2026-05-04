export default {
  async fetch(request) {
    const url = new URL(request.url)
    const query = url.searchParams.get("q")

    if (!query) {
      return new Response(JSON.stringify({
        status: "error",
        message: "検索ワードが空です"
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    const apiUrl = "https://snapshot.search.nicovideo.jp/api/v2/snapshot/video/contents/search"

    const params = new URLSearchParams({
      q: query, // ← ここは自動でエンコードされるのでOK
      targets: "title",
      fields: "contentId,title,viewCounter",
      "filters[viewCounter][gte]": "10000",
      "_sort": "-viewCounter",
      "_offset": "0",
      "_limit": "3",
      "_context": "apiguide"
    })

    try {
      const res = await fetch(`${apiUrl}?${params.toString()}`)
      const text = await res.text()

      const data = JSON.parse(text)

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      })

    } catch (e) {
      return new Response(JSON.stringify({
        status: "error",
        message: "API取得失敗",
        error: String(e)
      }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      })
    }
  }
}
