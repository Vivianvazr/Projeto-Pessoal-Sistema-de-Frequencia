import express from 'express'
import fs from 'fs/promises'
import path from 'path'

const router = express.Router()

interface Aluno {
  id: number
  nome: string
}

interface Presenca {
  alunoId: number
  data: string
}

const alunos: Aluno[] = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Oliveira' },
  { id: 3, nome: 'Pedro Santos' }
]

const presencas: Presenca[] = []

const salvarFrequencia = async () => {
  const publicDir = path.join(__dirname, '..', 'public')
  await fs.mkdir(publicDir, { recursive: true }).catch(() => {})
  const filePath = path.join(publicDir, 'frequencia.json')
  await fs.writeFile(filePath, JSON.stringify({ presencas }, null, 2))
}

const lerFrequencia = async (): Promise<{ presencas: Presenca[] }> => {
  const filePath = path.join(__dirname, '..', 'public', 'frequencia.json')
  return fs.readFile(filePath, 'utf-8').then(data => JSON.parse(data)).catch(() => ({ presencas: [] }))
}

router.get('/', (req, res) => {
  res.json({
    mensagem: 'Sistema de Frequência Escolar',
    instrucoes: {
      listar_alunos: 'GET /alunos',
      adicionar_aluno: 'GET /adicionar-aluno?nome=NomeDoAluno',
      registrar_presenca: 'GET /presenca?alunoId=1&data=2023-10-01',
      listar_presencas: 'GET /presencas',
      salvar_frequencia: 'GET /salvar'
    }
  })
})

router.get('/alunos', (req, res) => {
  res.json({ alunos })
})

router.get('/adicionar-aluno', (req, res) => {
  const nome = req.query.nome as string

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório' })
  }

  const novoId = alunos.length > 0 ? alunos[alunos.length - 1].id + 1 : 1
  alunos.push({ id: novoId, nome })
  res.json({ mensagem: 'Aluno adicionado', aluno: { id: novoId, nome } })
})

router.get('/presenca', async (req, res) => {
  const alunoId = parseInt(req.query.alunoId as string)
  const data = req.query.data as string

  if (!alunoId || !data) {
    return res.status(400).json({ erro: 'alunoId e data são obrigatórios' })
  }

  const aluno = alunos.find(a => a.id === alunoId)
  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' })
  }

  const existente = presencas.find(p => p.alunoId === alunoId && p.data === data)
  if (existente) {
    return res.status(409).json({ erro: 'Presença já registrada' })
  }

  presencas.push({ alunoId, data })
  await salvarFrequencia()
  res.json({ mensagem: 'Presença registrada', presenca: { alunoId, data } })
})

router.get('/presencas', async (req, res) => {
  const data = await lerFrequencia()
  const presencasComAlunos = data.presencas.map((p: Presenca) => {
    const aluno = alunos.find(a => a.id === p.alunoId)
    return {
      ...p,
      nome: aluno ? aluno.nome : 'Desconhecido'
    }
  })
  res.json({ presencas: presencasComAlunos })
})

router.get('/salvar', async (req, res) => {
  await salvarFrequencia()
  res.json({ mensagem: 'Frequência salva em /presencas' })
})

export default router
