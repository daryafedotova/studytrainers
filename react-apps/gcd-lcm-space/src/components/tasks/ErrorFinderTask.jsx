export function ErrorFinderTask({ task, disabled, onSubmit }) {
  return (
    <div className="solution-steps">
      {task.data.steps.map((step,index) => (
        <button key={index} type="button" className="solution-step" disabled={disabled} onClick={() => onSubmit(index)}>
          <span>{index + 1}</span><strong>{step}</strong>
        </button>
      ))}
      <p className="workspace-label">Нажми на первый неверный шаг.</p>
    </div>
  );
}
