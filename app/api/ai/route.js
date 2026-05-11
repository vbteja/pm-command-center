import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  const { question } = await request.json()

  const [tasks, risks, okrs, compliance, stakeholders, budget, sprints] = await Promise.all([
    supabase.from('tasks').select('*'),
    supabase.from('risks').select('*'),
    supabase.from('okrs').select('*, key_results(*)'),
    supabase.from('compliance').select('*'),
    supabase.from('stakeholders').select('*'),
    supabase.from('budget').select('*'),
    supabase.from('sprints').select('*'),
  ])

  const context = `
You are an expert Product Manager AI assistant. Here is the current project data:

SPRINT: ${JSON.stringify(sprints.data)}
TASKS: ${JSON.stringify(tasks.data)}
RISKS: ${JSON.stringify(risks.data)}
OKRs: ${JSON.stringify(okrs.data)}
COMPLIANCE: ${JSON.stringify(compliance.data)}
STAKEHOLDERS: ${JSON.stringify(stakeholders.data)}
BUDGET: ${JSON.stringify(budget.data)}

Answer the following question based on this data. Be specific, concise and actionable. Format your response in clear bullet points.
`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${context}\n\nQuestion: ${question}`
      }
    ]
  })

  return NextResponse.json({
    answer: message.content[0].text
  })
}