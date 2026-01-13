import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sun, Sunset, Moon, ArrowRight, Loader2, History, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShiftType = 'morning' | 'afternoon' | 'night';
type AreaType = 'production' | 'warehouse' | 'maintenance' | 'quality' | 'logistics' | 'administrative';

const shifts = [
  {
    id: 'morning' as ShiftType,
    label: 'Manhã',
    time: '06:00 - 14:00',
    icon: Sun,
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-400',
  },
  {
    id: 'afternoon' as ShiftType,
    label: 'Tarde',
    time: '14:00 - 22:00',
    icon: Sunset,
    gradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/50',
    iconColor: 'text-orange-400',
  },
  {
    id: 'night' as ShiftType,
    label: 'Noite',
    time: '22:00 - 06:00',
    icon: Moon,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-400',
  },
];

const areas: { id: AreaType; label: string }[] = [
  { id: 'production', label: 'Produção' },
  { id: 'warehouse', label: 'Almoxarifado' },
  { id: 'maintenance', label: 'Manutenção' },
  { id: 'quality', label: 'Qualidade' },
  { id: 'logistics', label: 'Logística' },
  { id: 'administrative', label: 'Administrativo' },
];

export default function ShiftPage() {
  const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStartForm = async () => {
    if (!selectedShift || !selectedArea || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_sessions')
        .insert({
          user_id: user.id,
          shift: selectedShift,
          area: selectedArea,
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/form/${data.id}`);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o formulário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2">Iniciar Checklist</h1>
          <p className="text-muted-foreground">
            Selecione o turno e a área para começar a auditoria
          </p>
        </div>

        {/* Area Selection */}
        <div className="mb-6 animate-slide-in">
          <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Área de Trabalho
          </Label>
          <Select
            value={selectedArea || ''}
            onValueChange={(value) => setSelectedArea(value as AreaType)}
          >
            <SelectTrigger className="w-full py-6 text-base bg-card border-border">
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shift Selection */}
        <div className="space-y-4 mb-8">
          <Label className="text-sm font-medium text-foreground">Turno</Label>
          {shifts.map((shift, index) => {
            const Icon = shift.icon;
            const isSelected = selectedShift === shift.id;

            return (
              <button
                key={shift.id}
                onClick={() => setSelectedShift(shift.id)}
                className={cn(
                  'w-full p-6 rounded-xl border-2 transition-all duration-300 animate-slide-in',
                  'flex items-center gap-4 text-left',
                  isSelected
                    ? `bg-gradient-to-r ${shift.gradient} ${shift.borderColor}`
                    : 'bg-card border-border hover:border-muted-foreground/50'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    'flex items-center justify-center h-14 w-14 rounded-xl',
                    isSelected ? `bg-gradient-to-r ${shift.gradient}` : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn('h-7 w-7', isSelected ? shift.iconColor : 'text-muted-foreground')}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{shift.label}</h3>
                  <p className="text-sm text-muted-foreground">{shift.time}</p>
                </div>
                {isSelected && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleStartForm}
          disabled={!selectedShift || !selectedArea || loading}
          className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-glow-primary disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Iniciando...
            </>
          ) : (
            <>
              Iniciar Checklist
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        {/* History Link */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/history')}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Ver Histórico Completo
          </Button>
        </div>
      </main>
    </div>
  );
}
