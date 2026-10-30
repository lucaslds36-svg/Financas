import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { BudgetCategory, PaymentMethod, RealTransaction, MonthIndex } from '../types/budget';
import { PAYMENT_METHOD_LABELS } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  onSave: (transaction: Omit<RealTransaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: RealTransaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
  editingTransaction,
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [categoryId, setCategoryId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');

  // Filter categories by selected type
  const availableCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableItems = selectedCategory?.items || [];

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setCategoryId(editingTransaction.categoryId);
      setItemId(editingTransaction.itemId || '');
      setCustomItemName(editingTransaction.itemName || '');
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);
      setPaymentMethod(editingTransaction.paymentMethod);
      setStatus(editingTransaction.status);
    } else {
      // Default reset
      const firstCat = availableCategories[0];
      if (firstCat && !categoryId) {
        setCategoryId(firstCat.id);
        if (firstCat.items.length > 0) {
          setItemId(firstCat.items[0].id);
        }
      }
    }
  }, [editingTransaction, isOpen]);

  // When type changes, adjust category
  useEffect(() => {
    if (!editingTransaction && availableCategories.length > 0) {
      const match = availableCategories.find((c) => c.id === categoryId);
      if (!match) {
        setCategoryId(availableCategories[0].id);
        if (availableCategories[0].items.length > 0) {
          setItemId(availableCategories[0].items[0].id);
        } else {
          setItemId('');
        }
      }
    }
  }, [type]);

  // When category changes, adjust item
  useEffect(() => {
    if (!editingTransaction && selectedCategory) {
      if (selectedCategory.items.length > 0) {
        setItemId(selectedCategory.items[0].id);
      } else {
        setItemId('');
      }
    }
  }, [categoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um valor numérico válido.');
      return;
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const currentItem = currentCat?.items.find((i) => i.id === itemId);
    const finalItemName = currentItem ? currentItem.name : customItemName.trim() || 'Outro';

    // Extract month from date
    const dateObj = new Date(date + 'T00:00:00');
    const month = (isNaN(dateObj.getMonth()) ? 10 : dateObj.getMonth()) as MonthIndex;

    onSave({
      date,
      month,
      type,
      categoryId: categoryId || 'cat_diversos_despesas',
      categoryName: currentCat ? currentCat.name : 'Diversos',
      itemId: itemId || undefined,
      itemName: finalItemName,
      amount: parsedAmount,
      description: description.trim() || finalItemName,
      paymentMethod,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {editingTransaction ? 'Editar Lançamento Real' : 'Novo Lançamento Real'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Registre despesas ou receitas reais para comparar com o orçado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo: Despesa ou Receita */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Tipo de Movimentação
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Despesa (Gasto Real)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Receita (Entrada Real)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-neutral-500">
                  R$
                </span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono font-medium border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Data */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Data do Gasto *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Categoria da Planilha *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Item vinculado */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Item Vinculado
              </label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
                <option value="">Outro (especificar abaixo)</option>
              </select>
            </div>
          </div>

          {/* Item customizado se não encontrou */}
          {!itemId && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Nome do Item Específico
              </label>
              <input
                type="text"
                placeholder="Ex: Farmácia, Consulta, Presente de Aniversário..."
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Descrição / Estabelecimento
            </label>
            <input
              type="text"
              placeholder="Ex: Compras no Pão de Açúcar, Posto Ipiranga..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Forma de Pagamento */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="paid">Pago / Concretizado</option>
                <option value="pending">Pendente / Agendado</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Atualizar Lançamento' : 'Salvar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
