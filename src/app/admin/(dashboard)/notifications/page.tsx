import { SendNotificationForm } from "@/components/admin/SendNotificationForm";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Enviar notificação
        </h1>
        <p className="text-muted-foreground">
          Envie notificações push para todos os usuários, por plano ou para um
          usuário específico.
        </p>
      </div>

      <div className="admin-card-glass rounded-xl p-6 shadow-sm">
        <SendNotificationForm />
      </div>
    </div>
  );
}
