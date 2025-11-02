import { Ingestion } from "../src/platform/ingestion";

export function generateTestData() {
  let ingestions: Array<Ingestion> = [];

  // Every day
  for (let i = 0; i < 20; i += 1) {
    ingestions.push(
      Ingestion.empty().merge({
        offset: `${i}days`,
        drugName: "Test",
        dosage: "0.1mg",
        halfLife: "6days",
      })
    );
  }

  // Every second day
  for (let i = 20; i < 90; i += 2) {
    ingestions.push(
      Ingestion.empty().merge({
        offset: `${i}days`,
        drugName: "Test",
        dosage: "0.2mg",
        halfLife: "6days",
      })
    );
  }

  // Every third day
  // for (let i = 20; i < 90; i += 3) {
  //   ingestions.push(
  //     Ingestion.empty().merge({
  //       offset: `${i}days`,
  //       drugName: "Test",
  //       dosage: "0.3mg",
  //       halfLife: "6days",
  //     })
  //   );
  // }

  return ingestions;
}


  const [ingestions, setIngestions] = useState<Array<Ingestion>>([
    Ingestion.new({ offset: '0days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '1days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '2days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '3days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '4days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '5days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '6days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
    Ingestion.new({ offset: '7days', drugName: 'Caffine', dosage: '100mg', halfLife: '8h' }),
  ]);