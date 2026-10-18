type SynapseMarkProps = {
  size?: number;
  className?: string;
};

export function SynapseMark({ size = 34, className }: SynapseMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="15" fill="#286955" />
      <path
        d="M43 14H27a9 9 0 0 0 0 18h10a9 9 0 0 1 0 18H21"
        fill="none"
        stroke="#fafbf8"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="43" cy="14" r="4.5" fill="#9fd5bd" />
      <circle cx="21" cy="50" r="4.5" fill="#9fd5bd" />
    </svg>
  );
}
