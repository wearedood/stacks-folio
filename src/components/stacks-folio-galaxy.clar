;; StacksFolio Galaxy NFT
;; SIP-009 compliant NFT contract
;; Each wallet can mint one unique galaxy NFT

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

(define-non-fungible-token stacks-folio-galaxy uint)

(define-data-var last-token-id uint u0)
(define-map token-owner-minted principal bool)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-ALREADY-MINTED (err u409))
(define-constant ERR-TOKEN-NOT-FOUND (err u404))
(define-constant ERR-NOT-OWNER (err u403))

;; SIP-009: get-last-token-id
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

;; SIP-009: get-token-uri
(define-read-only (get-token-uri (token-id uint))
  (ok (some (concat "https://stacks-folio.vercel.app/api/nft/" (uint-to-ascii token-id)))))

;; SIP-009: get-owner
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? stacks-folio-galaxy token-id)))

;; SIP-009: transfer
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (nft-get-owner? stacks-folio-galaxy token-id)) ERR-TOKEN-NOT-FOUND)
    (asserts! (is-eq (some sender) (nft-get-owner? stacks-folio-galaxy token-id)) ERR-NOT-OWNER)
    (nft-transfer? stacks-folio-galaxy token-id sender recipient)))

;; Mint — one per wallet
(define-public (mint)
  (let ((new-id (+ (var-get last-token-id) u1)))
    (asserts! (is-none (map-get? token-owner-minted tx-sender)) ERR-ALREADY-MINTED)
    (try! (nft-mint? stacks-folio-galaxy new-id tx-sender))
    (var-set last-token-id new-id)
    (map-set token-owner-minted tx-sender true)
    (ok new-id)))

;; Check if address has minted
(define-read-only (has-minted (who principal))
  (is-some (map-get? token-owner-minted who)))

;; Helper: uint to ascii string
(define-private (uint-to-ascii (value uint))
  (if (<= value u9)
    (unwrap-panic (element-at "0123456789" value))
    "0"))
