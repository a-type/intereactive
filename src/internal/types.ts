import { ElementType, ComponentPropsWithRef } from 'react';

/** @external */
/**  */

export enum KeyCode {
  Space = 32,
  Enter = 13,
  ArrowUp = 38,
  ArrowDown = 40,
  ArrowLeft = 37,
  ArrowRight = 39,
  Escape = 27,
  Shift = 16,
  Alt = 18,
  Control = 17,
}

// this is not as robust a solution as things like Material-UI,
// but it's the only thing I've tried that 'works' so far.
export type OverridableProps<P, D extends ElementType> = P &
  (
    | ({
        component?: D;
      } & ComponentPropsWithRef<D>)
    | {
        component: ElementType;
        [propType: string]: any;
      }
  );

export type GenericProps = { [prop: string]: any };
