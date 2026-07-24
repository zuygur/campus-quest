export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { completedTitles, remainingQuests } = req.body

  if (!remainingQuests || remainingQuests.length === 0) {
    return res.status(200).json({ recommendation: null })
  }

  try {
    const prompt = `
A student has completed these campus quests:
${completedTitles.join(', ') || 'none'}

Remaining quests:
${remainingQuests
  .map((q) => `${q.title} (${q.reward_amount} Campus Tokens)`)
  .join(', ')}

Choose ONLY ONE quest from the remaining list.

Return ONLY valid JSON in this format:

{
  "quest_title": "...",
  "reward_amount": 20,
  "reason": "..."
}
`

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-ultra-550b-a55b:free", 
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    )

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      console.error(data)

      return res.status(500).json({
        error: "OpenRouter returned no response",
        details: data
      })
    }

    const rawText = data.choices[0].message.content

    console.log(rawText)

    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    const result = JSON.parse(cleaned)

    return res.status(200).json({
      recommendation: result
    })

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      error: err.message
    })
  }
}