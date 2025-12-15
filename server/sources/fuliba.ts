import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const fuliba = defineSource(async () => {
  const html: any = await myFetch("https://fuliba.net/")
  const $ = cheerio.load(html)

  const news: NewsItem[] = []

  $("article.excerpt").each((_, el) => {
    const a = $(el).find("h2 a")
    const title = a.text().trim()
    const url = a.attr("href")
    /** 1️⃣ 时间（福利吧一般在 time / .time 里） */
    const date = $(el)
      .find("time, .time")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim()
    console.info(date, "fulibatime")
    // Fuliba 的列表摘要（可能为空）
    const desc = $(el)
      .find(".note, .excerpt-c3, p")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim()

    if (!title || !url) return

    news.push({
      id: url,
      title,
      url,
      extra: {
        hover: desc || undefined,
        date: date || undefined,
      },
    })
  })

  return news
})

export default fuliba
