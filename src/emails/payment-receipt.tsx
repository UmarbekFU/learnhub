import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from "@react-email/components";

interface PaymentReceiptProps {
  name: string;
  courseTitle: string;
  amount: string;
  date: string;
}

export default function PaymentReceipt({ name, courseTitle, amount, date }: PaymentReceiptProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment receipt for {courseTitle}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "40px", borderRadius: "8px", margin: "40px auto", maxWidth: "580px" }}>
          <Heading style={{ fontSize: "24px", color: "#333" }}>
            Payment Receipt
          </Heading>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Hi {name},
          </Text>
          <Text style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
            Thank you for your purchase!
          </Text>
          <Section style={{ backgroundColor: "#f9fafb", padding: "20px", borderRadius: "8px", margin: "20px 0" }}>
            <Text style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
              <strong>Course:</strong> {courseTitle}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
              <strong>Amount:</strong> {amount}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
              <strong>Date:</strong> {date}
            </Text>
          </Section>
          <Text style={{ fontSize: "14px", color: "#999", marginTop: "32px" }}>
            The LearnHub Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
