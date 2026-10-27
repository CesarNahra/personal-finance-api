import { Router } from 'express';

import transactionController from '../controllers/transactionController.js';

const router = Router();

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.patch('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;