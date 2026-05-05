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
      q: query,
      targets: "title",
      fields: "contentId,title,viewCounter",
      "filters[viewCounter][gte]": "10000",
      "_sort": "-viewCounter",
      "_offset": "0",
      "_limit": "3",
      "_context": "apiguide"
    })

    try {
      const res = await fetch(`${apiUrl}?${params.toString()}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
          "Referer": "https://www.nicovideo.jp/",
          "Origin": "https://www.nicovideo.jp"
        }
      })

      if (!res.ok) {
        return new Response(JSON.stringify({
          status: "error",
          message: `HTTPエラー: ${res.status}`
        }), {
          headers: { "Content-Type": "application/json" },
          status: res.status
        })
      }

      const data = await res.json()

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json; charset=UTF-8" }
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
