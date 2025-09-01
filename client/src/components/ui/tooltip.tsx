import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import type { TooltipProps as ChakraTooltipProps } from '@chakra-ui/react';
import * as React from 'react';

export interface TooltipProps extends Omit<ChakraTooltipProps, 'label'> {
  showArrow?: boolean;
  portalled?: boolean;
  content: string;
  disabled?: boolean;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      ...rest
    } = props;

    if (disabled) return <>{children}</>;

    return (
      <ChakraTooltip
        label={content}
        hasArrow={showArrow}
        usePortal={portalled}
        {...rest}
        ref={ref}
      >
        {children}
      </ChakraTooltip>
    );
  }
);
