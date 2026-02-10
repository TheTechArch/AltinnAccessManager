import { useEnvironment, type Environment } from '../context/EnvironmentContext';

export function EnvironmentSelector() {
  const { environment, setEnvironment } = useEnvironment();

  const environments: { value: Environment; label: string; color: string }[] = [
    { value: 'tt02', label: 'TT02', color: 'bg-amber-500' },
    { value: 'prod', label: 'PROD', color: 'bg-green-600' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-700 rounded-md p-1">
      {environments.map((env) => (
        <button
          key={env.value}
          onClick={() => setEnvironment(env.value)}
          className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
            environment === env.value
              ? `${env.color} text-white`
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
          title={env.value === 'tt02' ? 'Test environment' : 'Production environment'}
        >
          {env.label}
        </button>
      ))}
    </div>
  );
}
