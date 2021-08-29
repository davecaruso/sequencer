import React from 'react';
import { useAppState } from '../frontend-state';

export function ResourceInspector() {
  const app = useAppState();
  const [id, setId] = React.useState('');

  const resource = app.resources[id];

  return (
    <div>
      <h1>resource inspector</h1>
      <div style={{ width: '50%', display: 'inline-block' }}>
        <ul>
          {Object.values(app.resources).map((r) => (
            <li key={r.id} onClick={() => setId(r.id)}>
              {r.type} {r.id}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ width: '50%', display: 'inline-block' }}>
        {resource && (
          <div>
            <h2>
              {resource.type} {resource.id}
            </h2>
            <pre>
              <code>{JSON.stringify(resource, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
