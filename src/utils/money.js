export function toCents(amount) {
  if (
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new TypeError(
      'Amount must be a finite number greater than zero.'
    );
  }

  const scaledAmount = amount * 100;
  const roundedAmount = Math.round(scaledAmount);

  const tolerance =
    Number.EPSILON * Math.max(1, Math.abs(scaledAmount)) * 4;

  if (
    Math.abs(scaledAmount - roundedAmount) > tolerance
  ) {
    throw new TypeError(
      'Amount must have no more than two decimal places.'
    );
  }

  if (!Number.isSafeInteger(roundedAmount)) {
    throw new RangeError(
      'Amount exceeds the supported monetary range.'
    );
  }

  return roundedAmount;
}

export function fromCents(amountInCents) {
  if (!Number.isSafeInteger(amountInCents)) {
    throw new TypeError(
      'Amount in cents must be a safe integer.'
    );
  }

  return amountInCents / 100;
}