export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const AI_API_KEY = process.env.AI_API_KEY
  
  if (!AI_API_KEY) {
    return res.status(500).json({ error: 'AI API Key not configured' })
  }

  try {
    const { input } = req.body

    if (!input) {
      return res.status(400).json({ error: 'Input is required' })
    }

    const prompt = `请根据以下个人简介，生成一份完整的简历信息。请严格按照JSON格式返回，不要包含任何其他文字说明。

个人简介：${input}

请返回以下JSON格式（只返回JSON，不要有其他内容）：
{
  "name": "姓名",
  "jobTitle": "职位",
  "phone": "电话",
  "email": "邮箱",
  "address": "地址",
  "birthday": "出生年月",
  "workYears": "工作年限",
  "education": "学历",
  "jobIntention": "求职意向",
  "summary": "个人简介",
  "educationList": [{"school":"学校","major":"专业","degree":"学位","startTime":"开始时间","endTime":"结束时间"}],
  "workList": [{"company":"公司","position":"职位","startTime":"开始时间","endTime":"结束时间","description":"工作描述"}],
  "projectList": [{"name":"项目名称","description":"项目描述"}],
  "awardList": [{"name":"奖项名称","org":"颁发机构","time":"获奖时间"}],
  "skills": ["技能1", "技能2"]
}

注意：1. 如果简介中没有某些信息，请根据上下文合理推断或留空 2. 时间格式如"2020年9月" 3. 只返回JSON，不要有任何其他文字`

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API Error:', errorText)
      return res.status(response.status).json({ error: 'AI API request failed' })
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    res.status(200).json({ content })
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
