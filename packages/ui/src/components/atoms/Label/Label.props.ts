export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Optional hint rendered after the label, e.g. "(required)" or units. */
  hint?: string;
}
