function calculatePrice(basePrice, quantity, rules, context) {
  let price = basePrice;
  const breakdown = [];

  rules
    .sort((a, b) => a.priority - b.priority)
    .forEach(rule => {
      let applied = false;

      if (rule.type === "SEASONAL") {
        applied = true;
      }

      if (
        rule.type === "BULK" &&
        quantity >= rule.condition_data.min_quantity
      ) {
        applied = true;
      }

      if (
        rule.type === "USER_TIER" &&
        context.user_tier === rule.condition_data.tier
      ) {
        applied = true;
      }

      if (applied) {
        const discount = price * (rule.discount_percent / 100);
        price -= discount;

        breakdown.push({
          type: rule.type,
          discount_percent: rule.discount_percent,
          discount_amount: Number(discount.toFixed(2))
        });
      }
    });

  return {
    final_price: Number(price.toFixed(2)),
    breakdown
  };
}

module.exports = { calculatePrice };
