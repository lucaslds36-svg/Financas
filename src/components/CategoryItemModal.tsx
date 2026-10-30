import React, { useState } from 'react';
import { X, Plus, FolderPlus, ListPlus } from 'lucide-react';
import { BudgetCategory } from '../types/budget';

interface CategoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BudgetCategory[];
  defaultCategoryId?: string;
  onAddItem: (categoryId: string, itemName: string, initialValue?: number) => void;
  onAddCategory: (categoryName: string, type: 'income' | 'expense') => void;
}

export const CategoryItemModal: React.FC<CategoryItemModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCategoryId,
  onAddItem,
  onAddCategory,
}) => {
  const [mode, setMode] = useState<'item' | 'category'>(defaultCategoryId ? 'item' : 'item');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultCategoryId || (categories[0]?.id || '')
  );
  const [itemName, setItemName] = useState<string>('');
  const [initialMonthlyValue, setInitialMonthlyValue] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'item') {
      if (!itemName.trim()) {
        alert('Informe o nome do item.');
        return;
      }
      const val = parseFloat(initialMonthlyValue.replace(',', '.')) || 0;
      onAddItem(selectedCategoryId, itemName.trim(), val);
      setItemName('');
      setInitialMonthlyValue('');
    } else {
      if (!categoryName.trim()) {
        alert('Informe o nome da categoria.');
        return;
      }
      onAddCategory(categoryName.trim(), categoryType);
      setCategoryName('');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Personalizar Estrutura
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Adicione itens ou categorias ao seu orçamento
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Add Item and Add Category */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('item')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'item'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ListPlus className="w-4 h-4 text-emerald-600" />
              <span>Novo Item de Gasto/Renda</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('category')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'category'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              <span>Nova Categoria</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'item' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Categoria de Destino *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type === 'income' ? 'Receita' : 'Despesa'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Streaming Disney+, Seguro Celular, IPVA..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Valor Padrão Mensal Estimado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-neutral-500">
                    R$
                  </span>
                  <input
                    type="text"
                    placeholder="0,00 (opcional)"
                    value={initialMonthlyValue}
                    onChange={(e) => setInitialMonthlyValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Se preenchido, será replicado em todos os 12 meses da planilha (você poderá alterar mês a mês depois).
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Tipo da Categoria
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryType('expense')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      categoryType === 'expense'
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType('income')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      categoryType === 'income'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Educação & Cursos, Animais de Estimação, Investimentos..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </>
          )}

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
              <Plus className="w-4 h-4" />
              <span>{mode === 'item' ? 'Adicionar Item' : 'Criar Categoria'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
