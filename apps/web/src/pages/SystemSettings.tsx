import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Setting = { setting_key: string; setting_value: string; description: string | null };

export function SystemSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<{ data: Setting[] }>('/settings')).data.data
  });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setValues(Object.fromEntries(data.map((s) => [s.setting_key, s.setting_value])));
  }, [data]);

  const save = useMutation({
    mutationFn: async (key: string) => api.put(`/settings/${key}`, { value: values[key] }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] })
  });

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">OPERATIONAL PARAMETERS</p>
          <h1>
            System <i>configuration</i>
          </h1>
        </div>
      </div>
      <article className="panel">
        <div className="settings-list">
          {data?.map((setting) => (
            <div className="settings-row" key={setting.setting_key}>
              <div>
                <b>{setting.setting_key}</b>
                <small>{setting.description}</small>
              </div>
              <input
                value={values[setting.setting_key] ?? ''}
                onChange={(e) => setValues({ ...values, [setting.setting_key]: e.target.value })}
              />
              <button className="text" onClick={() => save.mutate(setting.setting_key)} disabled={save.isPending}>
                Save
              </button>
            </div>
          ))}
        </div>
        <small>These values drive estimated travel time and cost calculations and are clearly labeled as configurable assumptions.</small>
      </article>
    </>
  );
}
