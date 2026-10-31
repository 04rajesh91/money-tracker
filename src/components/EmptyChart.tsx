interface Props {
  message: string;
}

export function EmptyChart({ message }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 flex items-center justify-center text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
