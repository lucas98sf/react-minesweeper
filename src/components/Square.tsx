import type { MouseEventHandler } from 'react';

type Props = {
  className: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onAuxClick: MouseEventHandler<HTMLButtonElement>;
  content: React.ReactNode;
};

export function Square(props: Props) {
  const { content, ...rest } = props;
  return <button {...rest}>{content}</button>;
}
