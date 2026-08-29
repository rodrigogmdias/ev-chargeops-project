import { CircleCheck } from 'lucide-react';
import { usePortal } from '../state/PortalState';
import './toast.css';

export default function Toast() {
  const { toast } = usePortal();
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <CircleCheck size={16} strokeWidth={2} className="toast__icon" />
      <span className="toast__text">{toast}</span>
    </div>
  );
}
