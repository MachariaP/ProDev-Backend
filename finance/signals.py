from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import ApprovalSignature, DisbursementApproval, LoanRepayment, Loan


@receiver(post_save, sender=ApprovalSignature)
def update_disbursement_approval_status(sender, instance, created, **kwargs):
    """
    Update DisbursementApproval status when a new signature is added.
    Automatically approve/reject when threshold is reached.
    """
    if created:
        approval = instance.approval
        
        # Count approved signatures
        approved_count = approval.signatures.filter(approved=True).count()
        rejected_count = approval.signatures.filter(approved=False).count()
        
        # Update approvals count
        approval.approvals_count = approved_count
        
        # Check if approval threshold is met
        if approved_count >= approval.required_approvals:
            approval.status = 'APPROVED'
            
            # Auto-update related loan or expense status
            if approval.loan:
                approval.loan.status = 'APPROVED'
                approval.loan.approved_at = timezone.now()
                approval.loan.save()
            elif approval.expense:
                approval.expense.status = 'APPROVED'
                approval.expense.approved_at = timezone.now()
                approval.expense.save()
        
        # Check if enough rejections to mark as rejected
        elif rejected_count > 0:
            approval.status = 'REJECTED'
            
            # Update related loan or expense
            if approval.loan:
                approval.loan.status = 'REJECTED'
                approval.loan.save()
            elif approval.expense:
                approval.expense.status = 'REJECTED'
                approval.expense.save()
        
        approval.save()


@receiver(post_save, sender=LoanRepayment)
def update_loan_balance(sender, instance, created, **kwargs):
    """
    Update loan outstanding balance when a repayment is made.
    Mark loan as completed when fully paid.
    """
    if created and instance.status == 'COMPLETED':
        loan = instance.loan
        
        # Calculate total repaid
        total_repaid = sum(
            repayment.amount 
            for repayment in loan.repayments.filter(status='COMPLETED')
        )
        
        # Update outstanding balance
        loan.outstanding_balance = loan.total_amount - total_repaid
        
        # Mark as completed if fully paid
        if loan.outstanding_balance <= 0:
            loan.status = 'COMPLETED'
            loan.completed_at = timezone.now()
        elif loan.status == 'DISBURSED':
            loan.status = 'ACTIVE'
        
        loan.save()
