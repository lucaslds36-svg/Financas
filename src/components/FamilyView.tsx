import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Smartphone, 
  Heart, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  ArrowLeft,
  Edit2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FamilyViewProps {
  onBack?: () => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({ onBack }) => {
  const { 
    user, 
    family, 
    familyMembers, 
    isLoading, 
    isSyncing, 
    error, 
    loginWithGoogle, 
    logout, 
    joinFamilyWithCode, 
    updateFamilyName 
  } = useAuth();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleCopyCode = () => {
    if (!family?.code) return;
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setActionMessage(null);
    const success = await joinFamilyWithCode(inputCode);
    if (success) {
      setActionMessage('Você agora está compartilhando o orçamento familiar com seu cônjuge!');
      setInputCode('');
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    await updateFamilyName(editedName);
    setIsEditingName(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 leading-tight">
              Orçamento Compartilhado do Casal
            </h2>
            <p className="text-xs text-neutral-500">
              Acesso simultâneo e em tempo real para você e sua esposa
            </p>
          </div>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar aos Cards</span>
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Content Card */}
      {!user ? (
        /* Logged Out: Sign in with Google */
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-neutral-900">
              Conecte com sua Conta Google
            </h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Para você e sua esposa lançarem gastos no mesmo aplicativo em celulares diferentes, faça login com sua conta do Google.
            </p>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-all shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Entrar com o Google</span>
          </button>
        </div>
      ) : (
        /* Logged In: Connected Space */
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          
          {/* User Connected Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Você'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  {user.displayName || 'Você'}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
              title="Desconectar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Family Workspace & Invite Code */}
          {family ? (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Espaço Compartilhado
                  </span>
                  <h4 className="text-base font-bold text-neutral-900">
                    {family.name}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  Sincronizado
                </span>
              </div>

              {/* Big Invite Code Box */}
              <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Código de Conexão do Casal
                  </span>
                  <span className="font-mono text-2xl font-black text-neutral-900 tracking-wider">
                    {family.code}
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Envie este código para sua esposa digitar no celular dela.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              {/* Members */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-neutral-600 block">
                  Integrantes Conectados ({familyMembers.length || 1}/2):
                </span>
                <div className="space-y-1.5">
                  {familyMembers.map((member) => (
                    <div
                      key={member.uid}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 text-xs"
                    >
                      <span className="font-semibold text-neutral-800">
                        {member.displayName} {member.uid === user.uid ? '(Você)' : ''}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium">Conectado</span>
                    </div>
                  ))}

                  {familyMembers.length < 2 && (
                    <div className="p-3 rounded-xl border border-dashed border-neutral-300 text-center text-xs text-neutral-400 bg-white/60">
                      Aguardando sua esposa entrar com o código <strong className="font-mono text-neutral-800">{family.code}</strong> no aparelho dela.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Join with another code */}
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-neutral-900">
                Entrar no código gerado pela sua esposa
              </h4>
              <p className="text-[11px] text-neutral-500">
                Se ela já gerou um código no celular dela, digite-o abaixo:
              </p>
            </div>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ex: 8X4K2P"
                maxLength={10}
                className="flex-1 px-3 py-2 text-xs font-mono tracking-wider uppercase border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isSyncing || !inputCode.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-colors"
              >
                Conectar
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
