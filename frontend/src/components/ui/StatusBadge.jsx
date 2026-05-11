export default function StatusBadge({ status }) {
  const map = {
    'Aberto': 'badge-aberto',
    'Em andamento': 'badge-andamento',
    'Fechado': 'badge-fechado',
    'Disponível': 'badge-disponivel',
    'Alocado': 'badge-alocado',
    'Em manutenção': 'badge-manutencao',
    'Danificado': 'badge-danificado',
    'Baixado': 'badge-baixado',
    'Pendente': 'badge-pendente',
    'Aprovada': 'badge-aprovada',
    'Recusada': 'badge-recusada',
    'Entregue': 'badge-entregue',
    'Cancelada': 'badge-cancelada',
    'Devolvido': 'badge-devolvido',
  };
  return <span className={`badge ${map[status] || 'badge-aberto'}`}>{status}</span>;
}
