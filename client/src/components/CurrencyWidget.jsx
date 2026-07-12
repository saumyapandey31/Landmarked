import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function CurrencyWidget({ homeCurrency = 'USD' }) {
  const [target, setTarget] = useState('EUR');
  const [amount, setAmount] = useState(100);

  const { data, error } = useQuery({
    queryKey: ['rate', homeCurrency, target],
    queryFn: async () => (await api.get('/currency/rate', { params: { base: homeCurrency, target } })).data,
  });

  const converted = data ? (amount * data.rate).toFixed(2) : null;

  return (
    <div className="bg-card border border-line rounded-xl2 p-5 shadow-card">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">Currency Converter</p>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-24 rounded-lg border border-line bg-bg-primary px-3 py-2 text-sm outline-none"
        />
        <span className="text-sm text-ink/60">{homeCurrency}</span>
        <span className="text-ink/40">→</span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-lg border border-line bg-bg-primary px-2 py-2 text-sm outline-none"
        >
          {['EUR', 'JPY', 'GBP', 'INR', 'AUD', 'THB'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-ink/60">Add an exchange rate API key to enable live rates.</p>}
      {converted && <p className="text-2xl font-display">{converted} {target}</p>}
    </div>
  );
}
