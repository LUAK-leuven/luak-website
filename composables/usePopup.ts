export default function () {
  const popup = useState<
    | {
        type: 'success' | 'warning' | 'error' | 'info';
        message: string;
      }
    | undefined
  >('popup');
  return popup;
}
