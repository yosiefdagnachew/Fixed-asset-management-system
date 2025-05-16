declare module '@headlessui/react' {
  import { ComponentProps, ElementType, ReactNode } from 'react';

  interface TransitionProps {
    as?: ElementType;
    show?: boolean;
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
    children: ReactNode;
    className?: string;
  }

  interface DialogProps {
    as?: ElementType;
    open?: boolean;
    onClose: (value: boolean) => void;
    className?: string;
    children: ReactNode;
  }

  interface DisclosureProps {
    as?: ElementType;
    defaultOpen?: boolean;
    children: (props: { open: boolean }) => ReactNode;
    className?: string;
  }

  interface MenuProps {
    as?: ElementType;
    children: ReactNode;
    className?: string;
  }

  interface MenuButtonProps {
    as?: ElementType;
    children: ReactNode;
    className?: string;
  }

  interface MenuItemsProps {
    as?: ElementType;
    static?: boolean;
    children: ReactNode;
    className?: string;
  }

  interface MenuItemProps {
    as?: ElementType;
    disabled?: boolean;
    children: (props: { active: boolean }) => ReactNode;
    className?: string;
  }

  export const Transition: React.FC<TransitionProps>;
  interface DialogTitleProps extends ComponentProps<'h2'> {
    as?: ElementType;
  }

  export const Dialog: React.FC<DialogProps> & {
    Panel: React.FC<ComponentProps<'div'>>;
    Title: React.FC<DialogTitleProps>;
    Description: React.FC<ComponentProps<'p'>>;
  };
  export const Disclosure: React.FC<DisclosureProps> & {
    Button: React.FC<ComponentProps<'button'>>;
    Panel: React.FC<ComponentProps<'div'>>;
  };
  export const Menu: React.FC<MenuProps> & {
    Button: React.FC<MenuButtonProps>;
    Items: React.FC<MenuItemsProps>;
    Item: React.FC<MenuItemProps>;
  };
}