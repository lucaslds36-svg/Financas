import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  ShoppingCart, 
  Home, 
  Car, 
  CreditCard, 
  Utensils, 
  HeartPulse, 
  Sparkles, 
  Tag, 
  User as UserIcon, 
  Calendar 
} from 'lucide-react';
import { BudgetCategory, PaymentMethod, RealTransaction, MonthIndex } from '../types/budget';
import { PAYMENT_METHOD_LABELS } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onSave: (transaction: Omit<RealTransaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: RealTransaction | null;
  defaultType?: 'income' | 'expense';
  defaultCategoryName?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
  editingTransaction,
  defaultType = 'expense',
  defaultCategoryName,
}) => {
  const { user, familyMembers } = useAuth();

  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');
  const [registeredBy, setRegisteredBy] = useState<string>(() => user?.displayName || 'Lucas');

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableItems = selectedCategory?.items || [];

  // Income presets
  const incomePresets = [
    { label: 'Salário Principal', icon: Wallet, itemKey: 'item_salarios', defaultDesc: 'Salário do mês' },
    { label: 'Vale / Adiantamento', icon: Wallet, itemKey: 'item_vale', defaultDesc: 'Vale quinzenal' },
    { label: 'Hora Extra', icon: Clock, itemKey: 'item_hora_extra', defaultDesc: 'Horas extras trabalhadas' },
    { label: 'Serviço por Fora (Bico)', icon: Briefcase, itemKey: 'item_servicos_fora', defaultDesc: 'Trabalho extra / Freela' },
    { label: 'Rendimentos', icon: TrendingUp, itemKey: 'item_juros_div', defaultDesc: 'Rendimentos / Aplicação' },
    { label: 'Outra Receita', icon: Sparkles, itemKey: 'item_diversos', defaultDesc: 'Outra entrada' },
  ];

  // Expense quick category presets
  const expensePresets = [
    { name: 'Supermercado', catId: 'cat_cotidiano', icon: ShoppingCart, defaultItem: 'Supermercado' },
    { name: 'Cartão de Crédito', catId: 'cat_obrigacoes', icon: CreditCard, defaultItem: 'Pagamentos do cartão de crédito' },
    { name: 'Casa & Contas', catId: 'cat_casa', icon: Home, defaultItem: 'Serviços Públicos' },
    { name: 'Combustível & Carro', catId: 'cat_transporte', icon: Car, defaultItem: 'Combustível' },
    { name: 'Jantar Fora & Lazer', catId: 'cat_cotidiano', icon: Utensils, defaultItem: 'Jantar fora' },
    { name: 'Saúde & Farmácia', catId: 'cat_saude', icon: HeartPulse, defaultItem: 'Medicamentos com prescrição' },
    { name: 'Investimento / Reserva', catId: 'cat_obrigacoes', icon: TrendingUp, defaultItem: 'Economias de longo prazo' },
  ];

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId);
      setItemId(editingTransaction.itemId || '');
      setCustomItemName(editingTransaction.itemName || '');
      setAmount(editingTransaction.amount.toString().replace('.', ','));
      setDescription(editingTransaction.description);
      setPaymentMethod(editingTransaction.paymentMethod);
      setStatus(editingTransaction.status);
      setRegisteredBy(editingTransaction.createdByName || user?.displayName || 'Lucas');
    } else {
      setType(defaultType);
      setDate(new Date().toISOString().slice(0, 10));
      setAmount('');
      setDescription('');
      setStatus('paid');
      setPaymentMethod('pix');
      setRegisteredBy(user?.displayName || 'Lucas');

      // Auto-select category
      const targetCats = categories.filter((c) => c.type === defaultType);
      if (defaultCategoryName) {
        const found = targetCats.find((c) => c.name.toLowerCase().includes(defaultCategoryName.toLowerCase()));
        if (found) {
          setCategoryId(found.id);
          setItemId(found.items[0]?.id || '');
          return;
        }
      }
      if (targetCats.length > 0) {
        setCategoryId(targetCats[0].id);
        setItemId(targetCats[0].items[0]?.id || '');
      }
    }
  }, [editingTransaction, isOpen, defaultType, defaultCategoryName]);

  // Handle preset income pick
  const handleSelectIncomePreset = (preset: typeof incomePresets[0]) => {
    const rendaCat = categories.find((c) => c.type === 'income' || c.id === 'cat_renda') || availableCategories[0];
    if (rendaCat) {
      setCategoryId(rendaCat.id);
      const targetItem = rendaCat.items.find(
        (i) => i.id === preset.itemKey || i.name.toLowerCase().includes(preset.label.toLowerCase())
      );
      if (targetItem) {
        setItemId(targetItem.id);
        setCustomItemName('');
      } else {
        setItemId('');
        setCustomItemName(preset.label);
      }
    }
    if (!description || description === 'Salário do mês' || description === 'Vale quinzenal' || description === 'Horas extras trabalhadas') {
      setDescription(preset.defaultDesc);
    }
  };

  // Handle preset expense pick
  const handleSelectExpensePreset = (preset: typeof expensePresets[0]) => {
    const foundCat = categories.find((c) => c.id === preset.catId || c.name.toLowerCase().includes(preset.name.toLowerCase()));
    if (foundCat) {
      setCategoryId(foundCat.id);
      const foundItem = foundCat.items.find((i) => i.name.toLowerCase().includes(preset.defaultItem.toLowerCase()));
      if (foundItem) {
        setItemId(foundItem.id);
        setCustomItemName('');
      } else {
        setItemId(foundCat.items[0]?.id || '');
      }
    }
    if (!description) {
      setDescription(preset.name);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert('Informe um valor numérico válido.');
      return;
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const currentItem = currentCat?.items.find((i) => i.id === itemId);
    const finalItemName = currentItem ? currentItem.name : customItemName.trim() || description || (type === 'income' ? 'Renda' : 'Despesa');

    const dateObj = new Date(date + 'T00:00:00');
    const month = (isNaN(dateObj.getMonth()) ? new Date().getMonth() : dateObj.getMonth()) as MonthIndex;

    onSave({
      date,
      month,
      type,
      categoryId: categoryId || (type === 'income' ? 'cat_renda' : 'cat_cotidiano'),
      categoryName: currentCat ? currentCat.name : (type === 'income' ? 'Renda' : 'Despesas'),
      itemId: itemId || undefined,
      itemName: finalItemName,
      amount: cleanAmount,
      description: description.trim() || finalItemName,
      paymentMethod,
      status,
      createdByName: registeredBy,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Type Selector */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-bold text-neutral-900">
              {editingTransaction ? 'Editar Lançamento' : 'Lançamento Rápido'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Toggle Tabs: Despesa vs Entrada */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const expCats = categories.filter((c) => c.type === 'expense');
                if (expCats.length > 0) {
                  setCategoryId(expCats[0].id);
                  setItemId(expCats[0].items[0]?.id || '');
                }
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Despesa (Gasto)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const incCats = categories.filter((c) => c.type === 'income');
                if (incCats.length > 0) {
                  setCategoryId(incCats[0].id);
                  setItemId(incCats[0].items[0]?.id || '');
                }
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Entrada (Receita)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* Quick Presets Bar */}
          {type === 'income' ? (
            <div>
              <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                O que você recebeu? (Atalhos rápidos)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {incomePresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectIncomePreset(preset)}
                      className="flex items-center gap-2 p-2 text-left rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-neutral-800 transition-colors text-xs font-medium"
                    >
                      <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Categorias Frequentes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {expensePresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectExpensePreset(preset)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-rose-400 hover:bg-rose-50/50 text-neutral-700 text-xs font-medium transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-neutral-400">
                  R$
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-lg font-mono font-bold border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Data *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 mb-1">
              Descrição / Detalhe
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'Ex: Horas extras da semana, Freela cliente X' : 'Ex: Compra semanal no Atacadão, Farmácia'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
            />
          </div>

          {/* Category & Item */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const cat = categories.find((c) => c.id === e.target.value);
                  setItemId(cat?.items[0]?.id || '');
                }}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Sub-item / Detalhe
              </label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
              >
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
                <option value="">Outro (especificar)</option>
              </select>
            </div>
          </div>

          {/* Quem Lançou / Pagou (Lucas vs Esposa) */}
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
            <span className="block text-xs font-bold text-neutral-800">
              {type === 'income' ? 'Quem recebeu este valor?' : 'Quem realizou este gasto?'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRegisteredBy(user?.displayName || 'Lucas')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  registeredBy.toLowerCase().includes('lucas') || registeredBy === (user?.displayName || 'Lucas')
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {user?.displayName || 'Lucas (Você)'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const partner = familyMembers.find((m) => m.uid !== user?.uid);
                  setRegisteredBy(partner?.displayName || 'Esposa');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  registeredBy.toLowerCase().includes('esposa') || (familyMembers.length > 1 && registeredBy !== user?.displayName)
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {familyMembers.find((m) => m.uid !== user?.uid)?.displayName || 'Esposa'}
              </button>

              <button
                type="button"
                onClick={() => setRegisteredBy('Casal / Conjunto')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  registeredBy === 'Casal / Conjunto'
                    ? 'bg-neutral-800 text-white border-neutral-800'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100'
                }`}
                title="Despesa ou receita conjunta do casal"
              >
                Casal
              </button>
            </div>
          </div>

          {/* Forma de Pagamento e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
              >
                <option value="paid">{type === 'income' ? 'Já caiu na conta' : 'Pago / Concretizado'}</option>
                <option value="pending">{type === 'income' ? 'A receber (Pendente)' : 'A pagar / Agendado'}</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-neutral-900 hover:bg-neutral-800'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Atualizar Lançamento' : 'Salvar no Orçamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
