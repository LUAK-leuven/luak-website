type Service = 'BCD';
type Version = '001' | '002';
type IdentificationCode = 'SCT';

export class EpcQrCode {
  private readonly service: Service = 'BCD';
  private readonly version: Version;
  private readonly char: (typeof EpcQrCode.encodingMap)[number][1] = '1';
  private readonly identificationCode: IdentificationCode = 'SCT';
  private readonly bic: string;
  private readonly name: string;
  private readonly iban: string;
  private readonly currency: 'EUR' = 'EUR' as const;
  private readonly amount: number;
  private readonly purpose: string;
  private readonly reference: string;
  private readonly information: string;

  private static readonly encodingMap = [
    ['UTF-8', '1'],
    ['ISO 8859-1', '2'],
    ['ISO 8859-2', '3'],
    ['ISO 8859-4', '4'],
    ['ISO 8859-5', '5'],
    ['ISO 8859-7', '6'],
    ['ISO 8859-10', '7'],
    ['ISO 8859-15', '8'],
  ] as const;

  constructor(props: {
    version?: Version;
    encoding?: (typeof EpcQrCode.encodingMap)[number][0];
    bic?: string;
    name: string;
    iban: string;
    amount: number;
    purpose?: string;
    structuredReference?: string;
    unstructuredReference?: string;
    information?: string;
  }) {
    this.version = props.version ?? '002';
    const encoding = props.encoding ?? 'UTF-8';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.char = single(
      EpcQrCode.encodingMap.filter((it) => it[0] === encoding),
    )![1];
    if (
      props.bic !== undefined &&
      !(props.bic.length === 8 || props.bic.length === 11)
    )
      throw new Error('bic must have 8 or 11 characters');
    if (props.bic === undefined && this.version === '001')
      throw new Error("bic is required for version '001'");
    this.bic = props.bic ?? '';

    validateLengthIsBetween(props.name, 'name', 1, 70);
    this.name = props.name;

    validateLengthIsBetween(props.iban, 'iban', 1, 34);
    this.iban = props.iban;

    this.amount = props.amount;

    validateLengthIsBetween(props.purpose, 'purpose', 1, 4);
    this.purpose = props.purpose ?? '';

    if (
      props.structuredReference !== undefined &&
      props.unstructuredReference !== undefined
    )
      throw new Error(
        'only one of structured reference or unstructured reference can be defined',
      );
    validateLengthIsBetween(
      props.structuredReference,
      'structuredReference',
      1,
      35,
    );
    validateLengthIsBetween(
      props.unstructuredReference,
      'unstructuredReference',
      1,
      140,
    );
    this.reference =
      props.structuredReference ?? props.unstructuredReference ?? '';

    validateLengthIsBetween(props.information, 'information', 1, 70);
    this.information = props.information ?? '';
  }

  toString() {
    return `
${this.service}
${this.version}
${this.char}
${this.identificationCode}
${this.bic}
${this.name}
${this.iban}
${this.currency}${this.amount.toFixed(2)}
${this.purpose}
${this.reference}
${this.information}`.trim();
  }
}
