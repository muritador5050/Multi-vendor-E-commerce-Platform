type DailySalesProps = {
  date: string;
  totalSales: number;
};

function generateLastNDays(count = 12): DailySalesProps[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - i));
    return {
      date: date.toISOString(),
      totalSales: 0,
    };
  });
}

function mergeWithSalesData(
  defaultDays: DailySalesProps[],
  realData: DailySalesProps[]
) {
  const salesMap = new Map(
    realData.map((d) => [new Date(d.date).toDateString(), d.totalSales])
  );

  return defaultDays.map((day) => {
    const key = new Date(day.date).toDateString();
    return {
      date: day.date,
      totalSales: salesMap.get(key) ?? 0,
    };
  });
}

export { mergeWithSalesData, generateLastNDays };
