'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteUser } from './actions'
import { toast } from 'sonner'

export function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${userEmail}? Esta acción no se puede deshacer y el usuario perderá el acceso inmediatamente.`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuario eliminado correctamente')
      }
    })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
