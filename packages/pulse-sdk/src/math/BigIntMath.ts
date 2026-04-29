export class BigIntMath {
  static max(...args: bigint[]) { return args.reduce((m, e) => e > m ? e : m); }
  static min(...args: bigint[]) { return args.reduce((m, e) => e < m ? e : m); }
}
