export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { completedTitles, remainingQuests } = req.body

  if (!remainingQuests || remainingQuests.length === 0) {
    return res.status(200).json({ recommendation: null })
  }

  try {
    const prompt = `A student has completed these campus quests: ${completedTitles.join(', ') || 'none yet'}.
The remaining available quests are: ${remainingQuests.map((q) => q.title).join(', ')}.
Pick exactly one quest from the remaining list that the student should do next, and give a short, friendly one-sentence reason why. Respond ONLY with valid JSON in this exact format, no extra text: {"quest_title": "...", "reason": "..."}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await response.json()
    const rawText = data.candidates[0].content.parts[0].text

    const cleanedText = rawText.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleanedText)

    return res.status(200).json({ recommendation: result })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Recommendation failed' })
  }
}