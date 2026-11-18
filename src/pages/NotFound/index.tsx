import { EmptyState } from '../../components/EmptyState'

export function NotFound() {
  return (
    <div className="container">
      <EmptyState
        title="Página não encontrada"
        description="O endereço que você tentou abrir não existe. Que tal voltar ao balcão e escolher um café?"
        actionLabel="Voltar ao catálogo"
        actionTo="/"
      />
    </div>
  )
}
