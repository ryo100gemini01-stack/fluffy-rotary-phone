export default {
  async fetch(request) {
    const url = new URL(request.url)

    const query = url.searchParams.get("q")

    // 追加パラメータ（デフォルト付き）
    const limit = url.searchParams.get("limit") || "3"
    const min = url.searchParams.get("min") || "10000"
    const sort = url.searchParams.get("sort") || "-viewCounter"
    const offset = url.searchParams.get("offset") || "0"
const date = url.searchParams.get("date")

    if (!query) {
      return new Response(JSON.stringify({
        status: "error",
        message: "検索ワードが空です"
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }

const now = Date.now()

let dateFilterParam = {}

if (date === "1") {
  dateFilterParam = {
    "filters[startTime][gte]": new Date(now - 86400 * 1000).toISOString()
  }
}

if (date === "7") {
  dateFilterParam = {
    "filters[startTime][gte]": new Date(now - 7 * 86400 * 1000).toISOString()
  }
}

if (date === "30") {
  dateFilterParam = {
    "filters[startTime][gte]": new Date(now - 30 * 86400 * 1000).toISOString()
  }
}

    const apiUrl = "https://snapshot.search.nicovideo.jp/api/v2/snapshot/video/contents/search"

  const params = new URLSearchParams({
  q: query,
  targets: "title,tags",
  fields: "contentId,title,viewCounter,thumbnailUrl,startTime",
  "filters[viewCounter][gte]": min,
  "_sort": sort,
  "_offset": offset,
  "_limit": limit,
  "_context": "apiguide",
  ...dateFilterParam
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

      const formatViews = (n) => {
        if (n >= 10000) {
          return (n / 10000).toFixed(1).replace(/\.0$/, "") + "万"
        }
        return n.toString()
      }

      const formatted = data.data.map(v => ({
        id: v.contentId,
        title: v.title,
        views: formatViews(v.viewCounter),
        thumbnail: v.thumbnailUrl,
        url: `https://www.nicovideo.jp/watch/${v.contentId}`
      }))

      return new Response(JSON.stringify({
        status: "ok",
        count: formatted.length,
        results: formatted
      }), {
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
