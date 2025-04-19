"use client";

import { useRef, useState, useCallback } from "react";
import { Camera } from "@/components/camera";
import { extractContactDetails } from "@/ai/flows/extract-contact-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  const captureFromFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          handleCapture(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = useCallback(async (photo: string) => {
    setPhoto(photo);
    try {
      setLoading(true);
      const result = await extractContactDetails({ photoUrl: photo });
      setFirstName(result.firstName);
      setLastName(result.lastName);
      setPhone(result.phone);
      setEmail(result.email);
       setCompany(result.company);
      setTitle(result.title);
      setAddress(result.address);
      setWebsite(result.website);
      toast({
        title: "Details Parsed",
        description: "Contact details extracted successfully.",
        action: <CheckCircle className="h-4 w-4 text-green-500" />,
      });
    } catch (error: any) {
      console.error("Error extracting contact details:", error);
      toast({
        variant: "destructive",
        title: "Parsing Error",
        description: error.message || "Failed to extract contact details.",
        action: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = () => {
    let vCardBody = `BEGIN:VCARD\nVERSION:3.0\n`;
    if (firstName || lastName) vCardBody += `N:${lastName};${firstName};;;\nFN:${firstName} ${lastName}\n`;
    if (company) vCardBody += `ORG:${company}\n`;
    if (title) vCardBody += `TITLE:${title}\n`;
    if (phone) vCardBody += `TEL:${phone}\n`;
    if (email) vCardBody += `EMAIL:${email}\n`;
    if (address) vCardBody += `ADR:${address}\n`;
    if (website) vCardBody += `URL:${website}\n`;
    if (photo) vCardBody += `PHOTO;ENCODING=BASE64;JPEG:${photo.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')}\n`;
    vCardBody += `END:VCARD`;

    const blob = new Blob([vCardBody], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contact.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Contact Saved",
      description: "vCard downloaded successfully. Import to your contacts.",
      action: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-4">
      <h1 className="text-2xl font-semibold mb-4">CardSnap Contacts</h1>

      {!photo ? (isMobile ? (
        <div>
          <input type="file" accept="image/*" capture="environment" onChange={captureFromFileInput} />
          {loading && <p>Loading...</p>}
        </div>
      ) : (
        <Camera ref={cameraRef} onCapture={handleCapture} loading={loading} />
      )) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Review Contact Details</CardTitle>
            <CardDescription>Edit the details below before saving.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <img src={photo} alt="Scanned Card" className="rounded-md shadow-sm" />
            </div>

            <div className="grid gap-2">
              <Input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input type="text" placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <Input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={handleSave} disabled={loading} className="bg-green-500 text-background hover:bg-green-700">
              Save Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
