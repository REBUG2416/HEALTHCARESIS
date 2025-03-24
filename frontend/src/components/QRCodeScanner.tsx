"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Html5Qrcode } from "html5-qrcode"
import { FiArrowLeft } from "react-icons/fi"
const ArrowLeftIcon = FiArrowLeft as unknown as React.FC<React.SVGProps<SVGSVGElement>>;


const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null

    const startScanner = async () => {
      try {
        setScanning(true)
        setError(null)

        html5QrCode = new Html5Qrcode("qr-reader")

        const qrCodeSuccessCallback = (decodedText: string) => {
          try {
            const data = JSON.parse(decodedText)

            if (data.type === "patient" && data.id) {
              setScanResult(`Patient ID: ${data.id}`)

              // Stop scanning
              if (html5QrCode) {
                html5QrCode
                  .stop()
                  .then(() => {
                    console.log("QR Code scanning stopped")
                  })
                  .catch((err) => {
                    console.error("Error stopping QR Code scanner:", err)
                  })
              }

              // Navigate to patient details
              setTimeout(() => {
                navigate(`/patients/${data.id}`)
              }, 1500)
            } else {
              setError("Invalid QR code format")
            }
          } catch (err) {
            setError("Invalid QR code data")
            console.error("Error parsing QR code data:", err)
          }
        }

        const config = { fps: 10, qrbox: { width: 250, height: 250 } }

        await html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, (errorMessage) => {
          // This is a non-fatal error, so we don't need to stop scanning
          console.log("QR Code scanning error:", errorMessage)
        })
      } catch (err) {
        setError("Failed to start QR code scanner. Please check camera permissions.")
        console.error("Error starting QR Code scanner:", err)
        setScanning(false)
      }
    }

    startScanner()

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => {
          console.error("Error stopping QR Code scanner:", err)
        })
      }
    }
  }, [navigate])

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Scan your QR Code Here</h2>
        <div className="text-sm text-gray-500">Scanning</div>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="inline mr-2" />
          Back
        </button>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

        {scanResult && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            <p>Successfully scanned: {scanResult}</p>
            <p className="mt-2">Redirecting to patient details...</p>
          </div>
        )}

        <div className="relative w-full max-w-md mx-auto">
          <div id="qr-reader" className="w-full h-80 border border-gray-300 rounded-lg overflow-hidden"></div>

          {scanning && !scanResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRCodeScanner

