;; StacksFolio Galaxy NFT - SIP-009

(define-trait nft-trait
  (
    (get-last-token-id () (response uint uint))
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))
    (get-owner (uint) (response (optional principal) uint))
    (transfer (uint principal principal) (response bool uint))
  )
)

(define-non-fungible-token stacks-folio-galaxy uint)
(define-data-var last-token-id uint u0)
(define-map token-owner-minted principal bool)

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-ALREADY-MINTED (err u409))
(define-constant ERR-TOKEN-NOT-FOUND (err u404))
(define-constant ERR-NOT-OWNER (err u403))

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some "https://stacks-folio.vercel.app/nft")))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? stacks-folio-galaxy token-id)))

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (nft-get-owner? stacks-folio-galaxy token-id)) ERR-TOKEN-NOT-FOUND)
    (asserts! (is-eq (some sender) (nft-get-owner? stacks-folio-galaxy token-id)) ERR-NOT-OWNER)
    (nft-transfer? stacks-folio-galaxy token-id sender recipient)))

(define-public (mint)
  (let ((new-id (+ (var-get last-token-id) u1)))
    (asserts! (is-none (map-get? token-owner-minted tx-sender)) ERR-ALREADY-MINTED)
    (try! (nft-mint? stacks-folio-galaxy new-id tx-sender))
    (var-set last-token-id new-id)
    (map-set token-owner-minted tx-sender true)
    (ok new-id)))

(define-read-only (has-minted (who principal))
  (is-some (map-get? token-owner-minted who)))
