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
  PlusCircle, 
  ArrowRight,
  X,
  Edit2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FamilySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FamilySyncModal: React.FC<FamilySyncModalProps> = ({ isOpen, onClose }) => {
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
    updateFamilyName,
    createNewFamily 
  } = useAuth();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                Orçamento Compartilhado do Casal
              </h2>
              <p className="text-xs text-neutral-500">
                Acesso simultâneo para você e sua esposa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {!user ? (
            /* Logged Out State: Value proposition & Google Sign In */
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <Users className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Lançamentos a Dois em Tempo Real
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Conecte com sua conta Google para que você e sua esposa possam abrir o app no celular de cada um, lançar compras de mercado, contas e ver o saldo atualizado na hora!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>No celular dos dois</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Funciona perfeitamente no navegador do iPhone ou Android sem precisar instalar nada pesado.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Seguro na Nuvem</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Banco de dados Firebase com sincronização instantânea e cópia de segurança automática.
                  </p>
                </div>
              </div>

              <button
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] transition-all shadow-md"
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
            /* Logged In State */
            <div className="space-y-6">
              {/* User profile card */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuário'}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900">
                        {user.displayName || 'Você'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                        Conectado
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 truncate block max-w-[200px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sair da conta"
                  className="p-2 text-neutral-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-neutral-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Family Workspace & Invite Code */}
              {family ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="px-2 py-1 text-xs border border-neutral-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-neutral-900">
                            {family.name}
                          </h4>
                          <button
                            onClick={() => {
                              setEditedName(family.name);
                              setIsEditingName(true);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-sm"
                            title="Editar nome da família"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-neutral-600">
                        Espaço familiar sincronizado na nuvem
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-white border border-emerald-200 text-emerald-800 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Ao vivo
                    </span>
                  </div>

                  {/* Big Invite Code Box */}
                  <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block">
                        Código de Convite do Casal
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-emerald-700 tracking-wider">
                        {family.code}
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Envie este código para sua esposa entrar no mesmo app
                      </p>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Código Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Members list */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-neutral-700 block">
                      Integrantes do Orçamento ({familyMembers.length || family.memberUids.length}/2):
                    </span>
                    <div className="space-y-1.5">
                      {familyMembers.map((member) => (
                        <div
                          key={member.uid}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-neutral-200/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {member.photoURL ? (
                              <img
                                src={member.photoURL}
                                alt={member.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-[10px]">
                                {member.displayName.charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-neutral-800">
                              {member.displayName} {member.uid === user.uid ? '(Você)' : ''}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            Ativo
                          </span>
                        </div>
                      ))}

                      {familyMembers.length < 2 && (
                        <div className="p-2.5 rounded-lg border border-dashed border-neutral-300 text-center text-xs text-neutral-500 bg-neutral-50/50">
                          Aguardando sua esposa entrar com o código <strong className="font-mono text-neutral-700">{family.code}</strong> no celular dela.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Join Existing Family Box (e.g. wife entering husband's code) */}
              <div className="border-t border-neutral-200 pt-5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Entrar no Orçamento de Outra Família
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Se seu cônjuge já gerou um código, digite-o aqui para unificar as contas:
                  </p>
                </div>

                <form onSubmit={handleJoin} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Ex: 8X4K2P"
                    maxLength={10}
                    className="flex-1 px-3 py-2 text-xs font-mono tracking-wider uppercase border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isSyncing || !inputCode.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-colors inline-flex items-center gap-1"
                  >
                    <span>Entrar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
