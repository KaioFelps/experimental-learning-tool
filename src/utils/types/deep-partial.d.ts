type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? // biome-ignore lint/complexity/noBannedTypes: <Precisa ser qualquer coisa, de fato>
      T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};
