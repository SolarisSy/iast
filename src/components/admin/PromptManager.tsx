'use client';

import { useState, useEffect } from 'react';

interface PromptValue {
  name: string;
  description: string;
  value: string | number;
  examples?: string[];
  variables?: string[];
  range?: [number, number];
  recommendation?: string;
}

interface PromptsConfig {
  version: string;
  lastUpdate: string;
  prompts: {
    [key: string]: PromptValue | {
      [subKey: string]: PromptValue;
    };
  };
  meta: {
    author: string;
    documentation: string;
    notes: string[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';

export default function PromptManager() {
  const [config, setConfig] = useState<PromptsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personality', 'niche']));

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/prompts`);
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
      } else {
        setError(data.error || 'Erro ao carregar prompts');
      }
    } catch (err) {
      setError('Erro de conexão com o backend');
      console.error('Erro ao carregar prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePrompts = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${API_URL}/api/prompts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Erro ao salvar prompts');
      }
    } catch (err) {
      setError('Erro de conexão com o backend');
      console.error('Erro ao salvar prompts:', err);
    } finally {
      setSaving(false);
    }
  };

  const updatePromptValue = (path: string[], value: string | number) => {
    if (!config) return;

    const newConfig = { ...config };
    let current: any = newConfig.prompts;

    // Navegar até o penúltimo nível
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    // Atualizar o valor
    current[path[path.length - 1]].value = value;

    setConfig(newConfig);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const renderPromptField = (key: string, prompt: PromptValue, path: string[]) => {
    const isExpanded = expandedSections.has(key);

    return (
      <div key={key} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => toggleSection(key)}
        >
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{prompt.name}</h4>
            <p className="text-sm text-gray-400">{prompt.description}</p>
          </div>
          <button className="text-gray-400 hover:text-white ml-4">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {/* Input Field */}
            {typeof prompt.value === 'string' ? (
              prompt.value.length > 100 ? (
                <textarea
                  value={prompt.value}
                  onChange={(e) => updatePromptValue(path, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm font-mono resize-y min-h-[150px]"
                  placeholder={prompt.description}
                />
              ) : (
                <input
                  type="text"
                  value={prompt.value}
                  onChange={(e) => updatePromptValue(path, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                  placeholder={prompt.description}
                />
              )
            ) : (
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={prompt.value}
                  onChange={(e) => updatePromptValue(path, parseFloat(e.target.value))}
                  className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                  step={0.1}
                  min={prompt.range?.[0]}
                  max={prompt.range?.[1]}
                />
                {prompt.range && (
                  <span className="text-sm text-gray-400">
                    Range: {prompt.range[0]} - {prompt.range[1]}
                  </span>
                )}
              </div>
            )}

            {/* Variables */}
            {prompt.variables && prompt.variables.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-400">Variáveis disponíveis: </span>
                <span className="text-cyan-400 font-mono">
                  {prompt.variables.map(v => `{${v}}`).join(', ')}
                </span>
              </div>
            )}

            {/* Recommendation */}
            {prompt.recommendation && (
              <div className="text-sm bg-blue-500/10 border border-blue-500/20 rounded px-3 py-2">
                <span className="text-blue-400">💡 {prompt.recommendation}</span>
              </div>
            )}

            {/* Examples */}
            {prompt.examples && prompt.examples.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Exemplos:</p>
                <ul className="list-disc list-inside space-y-1">
                  {prompt.examples.map((example, i) => (
                    <li key={i} className="text-sm text-gray-300">{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderNestedPrompts = (key: string, obj: any, parentPath: string[] = []) => {
    const currentPath = [...parentPath, key];

    // Se tem .value, é um prompt final
    if (obj.value !== undefined) {
      return renderPromptField(key, obj as PromptValue, currentPath);
    }

    // Senão, é um grupo
    const isExpanded = expandedSections.has(currentPath.join('.'));

    return (
      <div key={key} className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection(currentPath.join('.'))}
        >
          <h3 className="text-lg font-semibold text-purple-300">{key}</h3>
          <button className="text-purple-400 hover:text-purple-300">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {Object.entries(obj).map(([subKey, subValue]) =>
              renderNestedPrompts(subKey, subValue, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
          <span className="text-gray-400">Carregando configuração de prompts...</span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <p className="text-red-400">❌ {error || 'Erro ao carregar prompts'}</p>
        <button
          onClick={loadPrompts}
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🎭 Gerenciador de Personalidade e Prompts
            </h2>
            <p className="text-gray-300">
              Configure a personalidade, comportamento e estilo da IA
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Última atualização: {new Date(config.lastUpdate).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadPrompts}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
            >
              🔄 Recarregar
            </button>
            <button
              onClick={savePrompts}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg text-white font-semibold disabled:opacity-50"
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 animate-slide-in">
          <p className="text-green-400">✅ Prompts atualizados com sucesso!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Documentation */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-300 mb-2">📖 Documentação</h3>
        <p className="text-gray-300 mb-3">{config.meta.documentation}</p>
        <ul className="list-disc list-inside space-y-1">
          {config.meta.notes.map((note, i) => (
            <li key={i} className="text-sm text-gray-400">{note}</li>
          ))}
        </ul>
      </div>

      {/* Prompts */}
      <div className="space-y-4">
        {Object.entries(config.prompts).map(([key, value]) =>
          renderNestedPrompts(key, value)
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={loadPrompts}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
        >
          Cancelar
        </button>
        <button
          onClick={savePrompts}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-lg text-white font-semibold disabled:opacity-50"
        >
          {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}


